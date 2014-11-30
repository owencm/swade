class Api::SessionsController < Api::ApiController
  def new
    @session_id = loop do
      token = SecureRandom.urlsafe_base64
      break token unless Session.exists?(token: token)
    end
    
    session = Session.new
    session.token = @session_id
    session.save
    render :new
  end
end
