class CreateProducts < ActiveRecord::Migration
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.string :color, null: false
      t.string :features, null: false
      t.string :designer, null: false
      t.decimal :price, null: false, precision: 30, scale: 10
      
      
      t.integer :category_id, null: false
      t.integer :subcategory_id, null: false

      t.timestamps
    end
  end
end
