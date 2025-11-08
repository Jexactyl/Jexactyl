<?php

namespace Everest\Services\Billing;

use Illuminate\Support\Str;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\Category;

class BillingConfigImportService
{
    /**
     * Process a formatted JSON configuration file.
     */
    public function handle(array $import_data, bool $ignore_duplicates): void
    {
        $old_data = [];

        // Create new categories and map old category UUIDs to new ones
        foreach ($import_data['categories'] as $category) {
            // Skip existing categories if ignore_duplicates is true and a category with the same name exists
            if ($ignore_duplicates && Category::where('name', $category['name'])->exists()) {
                continue;  // Skip this category if it already exists
            } else {
                $new_uuid = Str::uuid()->toString();

                // Create the new category
                $new_category = Category::create([
                    'uuid' => $new_uuid, // don't overlap UUIDs
                    'name' => $category['name'],
                    'icon' => $category['icon'] ?? null,
                    'description' => $category['description'],
                    'visible' => (bool) $category['visible'],
                    'egg_id' => (int) $category['egg_id'],
                    'nest_id' => (int) $category['nest_id'],
                ]);

                // Map the old category UUID to the new category UUID
                $old_data[$category['uuid']] = $new_category->uuid;
            }
        }

        // Create products and assign them to the correct new category
        foreach ($import_data['products'] as $product) {
            // Skip existing products if ignore_duplicates is true and a product with the same name exists in the same category
            if ($ignore_duplicates && Product::where('name', $product['name'])
                                            ->where('category_uuid', $old_data[$product['category_uuid']] ?? null)
                                            ->exists()) {
                continue;  // Skip this product if it already exists in the same category
            } else {
                $category_id = null;
                $new_uuid = Str::uuid()->toString();

                // Check if the product's old category UUID exists in the mapping
                if (array_key_exists($product['category_uuid'], $old_data)) {
                    // Assign the new category UUID based on the old category UUID mapping
                    $category_id = $old_data[$product['category_uuid']];
                }

                // If no valid category_id was assigned, throw an error
                if ($category_id) {
                    // Create the product with the new category_id
                    Product::create([
                        'uuid' => $new_uuid, // don't overlap UUIDs
                        'name' => $product['name'],
                        'icon' => $product['icon'] ?? null,
                        'price' => (int) $product['price'],
                        'description' => $product['description'],
                        'visible' => (bool) $product['visible'],
                        'cpu_limit' => (int) $product['cpu_limit'],
                        'memory_limit' => (int) $product['memory_limit'],
                        'disk_limit' => (int) $product['disk_limit'],
                        'backup_limit' => (int) $product['backup_limit'],
                        'database_limit' => (int) $product['database_limit'],
                        'allocation_limit' => (int) $product['allocation_limit'],
                        'category_uuid' => $category_id, // Correctly assign the new category ID
                        'stripe_id' => null, // deprecated
                    ]);
                }
            }
        }
    }
}
