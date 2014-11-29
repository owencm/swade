class ProductsController < ApplicationController
  def cats
    @welcome_message = "All cats should be displayed here."
  end
  
  def subcats
    redirect_to cats_path
  end
  
  def products
    redirect_to cats_path
  end
end
