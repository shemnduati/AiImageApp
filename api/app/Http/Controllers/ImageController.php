<?php

namespace App\Http\Controllers;

use App\Enums\OperationEnum;
use App\Models\Image;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Transformation\Background;
use Cloudinary\Transformation\Resize;
use Cloudinary\Transformation\AspectRatio;
use Cloudinary\Asset\Image as CloudinaryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function fill(Request $request)
    {
        $operation = OperationEnum::GENERATIVE_FILL;
        $this->checkCredits($operation);

        $request->validate([
            'image' => 'required|image|max:10240',
            'aspectRatio' => 'required|string'
        ]);

        // Get the image and aspect ratio from the request
        $image = $request->file('image');
        $aspectRatio = $request->input('aspectRatio');

        // Convert aspect ratio string  to method name
        $aspectRatioMethod = $this->getAspectRatioMethod($aspectRatio);

        // upload original image to cloudinary
        $originalPublicId = $image->store('uploads');

        // Calculate width and height of the image 
        $imageSize = getimagesize($image);
        $originalWidth = $imageSize[0];
        $originalHeight = $imageSize[1];

        // Generate Fill with Cloudinary
        $pad = Resize::pad();
        if (in_array($aspectRatio, ['16:9', '4:3'])) {
            $pad->height($originalHeight);
        } else {
            $pad->width($originalWidth);
        }

        $generatedImg = (new CloudinaryImage($originalPublicId))->resize(
            resize: $pad
              ->aspectRatio(AspectRatio::{$aspectRatioMethod}())
              ->background(Background::generativeFill())

        );

        // Generate the URL for the transformed image
        $transformedImageUrl = $generatedImg->toUrl();

        $uploadResult = (new UploadApi())->upload(
            $transformedImageUrl,
            [
                'folder' => 'transformed/gen_fill', // Target folder in the cloudinary
                'public_id' => $image->getClientOriginalName(), //Optional: Set a specific public ID
            ]
        );

        // Get the full public URL
        $uploadedImageUrl = $uploadResult['secure_url'];

        //Optionally get the public ID (useful for Transformation, deletions)
        $transformedPublicId = 'uploads/' . $uploadResult['public_id'];

        // Save operation to Database
        $this->saveImageOperation(
            $originalPublicId,
            Storage::url($originalPublicId),
            $transformedPublicId,
            $uploadedImageUrl,
            OperationEnum::GENERATIVE_FILL->value,
            ['aspect_ratio'  => $aspectRatio]
        );

        // Deduct credits
        $this->deductCredits($operation);


        return response()->json([
            'message' => 'Image transformed successfully',
            'transformed_url' => $transformedImageUrl,
            'credits' => request()->user()->credits,
            'aspectRatio' => $aspectRatio
        ]);
    }

    public function getLatestOperations(Request $request)
    {
        $user = auth()->user();
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        $operations = Image::where('user_id', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->paginate($perPage, ['*'], 'page', $page);  

        // Add Operation Credits information
        $operations->getCollection()->transform(function ($operation) {
            $operationType = $operation->operation_type;
            $enumType = match ($operationType) {
                'generative_fill' => \App\Enums\OperationEnum::GENERATIVE_FILL,
                'restore'=> \App\Enums\OperationEnum::RESTORE,
                'remove_object' =>\App\Enums\OperationEnum::REMOVE_OBJECT,
                'recolor' => \App\Enums\OperationEnum::RECOLOR,
                default => null
            };

            $operation->credits_used = $enumType ? $enumType->credits() : 0;
            return $operation;
        });

        return response()->json([
            'operations' => $operations->items(),
            'pagination' => [
                'total' => $operations->total(),
                'per_page' =>$operations->perPage(),
                'current_page' =>$operations->currentPage(),
                'last_page' =>$operations->lastPage(),
                'has_more_pages' => $operations->hasMorePages()
            ]
        ]);

    }

    public function getOperation($id)
    {
        $user = auth()->user();
        $operation = Image::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        // Add operation credit information
        $operationType = $operation->operation_type;
        $enumType = match ($operationType) {
            'generative_fill' => \App\Enums\OperationEnum::GENERATIVE_FILL,
            'restore' => \App\Enums\OperationEnum::RESTORE,
            'remove_object' => \App\Enums\OperationEnum::REMOVE_OBJECT,
            'recolor' => \App\Enums\OperationEnum::RECOLOR,
            default => null
        };

        $operation->credits_used = $enumType ? $enumType->credits() : 0;

        return response()->json([
            'operation' => $operation,
        ]);
    }

    public function deleteOperation($id)
    {
        $user = auth()->user();
        $operation = Image::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        // Delete images from cloudinary if they exist
        try {
           if($operation->original_image_public_id){
                (new \Cloudinary\Api\Admin\AdminApi())->deleteAssets(
                    [$operation->original_image_public_id]
                );
           }

           if($operation->generated_image_public_id){
                (new \Cloudinary\Api\Admin\AdminApi())->deleteAssets(
                    [$operation->generated_image_public_id]
                );
           }
        } catch (\Exception $e) {
            //Log error but continue with the rest of the operation
            \Log::error('Failed to delete Cloudinary assets: ' . $e->getMessage());
        }

        // Delete the operation from the database
        $operation->delete();

        return response()->json([
            'message' => 'Operation deleted successfully',
        ]);
    }
      

    private function saveImageOperation(string $originalPublicId, string $originalImageUrl,string $generatedPublicId,string $generatedImageUrl, string $operationType, array $metadata = [])
    {
        Image::create([
            'user_id' => auth()->id(),
            'original_image_public_id' => $originalPublicId,
            'original_image' => $originalImageUrl,
            'generated_image_public_id' => $generatedPublicId,
            'generated_image' => $generatedImageUrl,
            'operation_type' => $operationType,
            'operation_metadata' => $metadata

        ]);
    }

    private function checkCredits(OperationEnum $operation): void
    {
        $user = auth()->user();
        $requiredCredits = $operation->credits();

        if($user->credits < $requiredCredits){
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json([
                    'message' => 'Insufficient credit, this operation requires {$requiredCredits} credits. You have {$user->credits} credits.',
                ], 403)
            );
        }
    }

    private function deductCredits(OperationEnum $operation): void
    {
        $user = auth()->user();
        $user->credits -= $operation->credits();
        $user->save();
    }

    public function getAspectRatioMethod(string $ratio): string
    {
        return match ($ratio) {
            '1:1' => 'ar1x1',
            '16:9' => 'ar16x9',
            '4:3' => 'ar4x3',
            default => 'ar1x1'
        };
    }
}
