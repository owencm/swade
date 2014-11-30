class AddImageUriToProduct < ActiveRecord::Migration
  def change
    add_column :products, :image_uri, :string, null: false, default: ""
  end
end
