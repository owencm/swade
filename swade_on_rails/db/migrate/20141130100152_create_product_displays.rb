class CreateProductDisplays < ActiveRecord::Migration
  def change
    create_table :product_displays do |t|
      t.string :token, null: false
      t.integer :product_id, null: false
      
      t.timestamps
    end
  end
end
