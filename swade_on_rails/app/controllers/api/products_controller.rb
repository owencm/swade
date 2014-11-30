class Api::ProductsController < Api::ApiController
  def create
    @response = "fail"
    if params.has_key?(:name) && params.has_key?(:color) && params.has_key?(:designer) &&
        params.has_key?(:price) && params.has_key?(:category) && params.has_key?(:subcategory) &&
        params.has_key?(:image_uri)
      product = Product.new
      product.name = params[:name]
      product.color = params[:color]
      product.features = "NO_FEATURES"
      product.designer = params[:designer]
      product.price = params[:price]
      
      category = Category.find_by(shortname: params[:category])
      subcategory = Subcategory.find_by(shortname: params[:subcategory])
      
      product.category_id = category.id
      product.subcategory_id = subcategory.id
      
      product.image_uri = params[:image_uri]
      
      if product.save
        @response = "success"
      end
    end
    
    render :create
  end
end
