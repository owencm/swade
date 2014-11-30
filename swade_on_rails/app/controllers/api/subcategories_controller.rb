class Api::SubcategoriesController < Api::ApiController
  def index
    @subcategories = Array.new
    
    if params.has_key?(:category)
      category = Category.find_by(shortname: params[:category])
      if category
        @subcategories = category.subcategories
      end
    end
    
    render :index
  end
end
