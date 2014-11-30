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
  
  def like
    @response = "fail"
    if params.has_key?(:session_id) && Session.exists?(token: params[:session_id]) &&
        params.has_key?(:product_id) && ProductDisplay.exists?(product_id: params[:product_id])
      session = Session.find_by(token: params[:session_id])
      product = Product.find(params[:product_id])
      
      category_weight = session.context.has_key?(product.category.shortname) ? session.context[product.category.shortname] : 1 + 1
      subcategory_weight = session.context.has_key?(product.subcategory.shortname) ? session.context[product.subcategory.shortname] : 1 + 1
      designer_weight = session.context.has_key?(product.designer) ? session.context[product.designer] : 1 + 1
      color_weight = session.context.has_key?(product.color) ? session.context[product.designer] : 1 + 1
      
      session.context[product.category.shortname] = category_weight
      session.context[product.subcategory.shortname] = subcategory_weight
      session.context[product.designer] = designer_weight
      session.context[product.color] = color_weight
      
      if session.save
        @response = "success"
      end
    end
    
    render :like
  end
  
  def index
    @products = Array.new
    
    if params.has_key?(:session_id) && Session.exists?(token: params[:session_id]) &&
        params.has_key?(:num_results)
      scored_products = Array.new
      
      session = Session.find_by(token: params[:session_id]) 
      remaining_items = params[:num_results].to_i 
      
      candidates_rel = Product.where("id NOT IN (SELECT DISTINCT product_id FROM product_displays WHERE token = '#{session.token}')")
      
      if params.has_key?(:category)
        category = Category.find_by(shortname: params[:category])
        if category
          candidates_rel.where!(category_id: category.id)
        end
      end
      
      if params.has_key?(:subcategory)
        category = Subcategory.find_by(shortname: params[:subcategory])
        if category
          candidates_rel.where!(subcategory_id: category.id)
        end
      end
      
      candidates = candidates_rel.to_a
      candidates.each do |candidate|
        if remaining_items > 0
          product_hash = {
            id: candidate.id,
            name: candidate.name,
            image_uri: candidate.image_uri,
            price: candidate.price
          }
          
          first_roll = rand(10)
          
          if first_roll < 3
            @products.push(product_hash)
            remaining_items = remaining_items - 1
          else
            score = 0
            
            if !params.has_key?(:category) && session.context.has_key?(candidate.category.shortname)
              score = score + rand(session.context[candidate.category.shortname].to_i)
            end
            
            if !params.has_key?(:subcategory) && session.context.has_key?(candidate.subcategory.shortname)
              score = score + rand(session.context[candidate.subcategory.shortname].to_i)
            end
            
            if session.context.has_key?(candidate.color)
              score = score + rand(session.context[candidate.color].to_i)
            end
            
            if session.context.has_key?(candidate.designer)
              score = score + rand(session.context[candidate.designer].to_i)
            end
            
            product_hash[:score] = -score
         
            scored_products.push(product_hash)
          end
        end
      end
      
      if remaining_items > 0
        scored_products.sort_by { |product_hash| product_hash[:score] }
        
        current_index = 0
        
        while current_index < sorted_products.count && remaining_items > 0 do
          @products.push(sorted_products[current_index])
          remaining_items = remaining_items - 1
          current_index = current_index + 1
        end
      end
      
      @products.each do |product|
        product_display = ProductDisplay.new
        product_display.product_id = product[:id]
        product_display.token = session.token
        product_display.save
      end
    end
    
    render :index
  end
end
