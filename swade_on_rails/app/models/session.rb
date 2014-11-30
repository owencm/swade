class Session < ActiveRecord::Base
  serialize :context, Hash
end
