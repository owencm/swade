class Api::CategoriesController < Api::ApiController
  def index
    @categories = Category.all
    render :index
  end
end
