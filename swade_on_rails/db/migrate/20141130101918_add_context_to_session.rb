class AddContextToSession < ActiveRecord::Migration
  def change
    add_column :sessions, :context, :text
  end
end
