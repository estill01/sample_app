# == Schema Information
# Schema version: 20110110192938
#
# Table name: users
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  email      :string(255)
#  created_at :datetime
#  updated_at :datetime
#
require 'digest'
class User < ActiveRecord::Base
  attr_accessor :password
  attr_accessible :name, :email, :password, :password_confirmation
  
  has_many :microposts, :dependent => :destroy
    
  email_regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i

  validates :name,      :presence     => true,
                        :length       => { :maximum => 50 }
  
  validates :email,     :presence     => true,
                        :format       => { :with => email_regex },
                        :uniqueness   => { :case_sensitive => false }

  validates :password,  :presence     => true,
                        :confirmation => true,
                        :length       => { :within => 6..40 }

  before_save :encrypt_password

  def has_password?(submitted_password)
    encrypted_password == encrypt(submitted_password)
  end
  
  def self.authenticate(email, submitted_password)
    user = find_by_email(email)
    return nil if user.nil?
    return user if user.has_password?(submitted_password)
  end
  
  def self.authenticate_with_salt(id, cookie_salt)
    user = find_by_id(id)
    (user && user.salt == cookie_salt) ? user : nil
  end
  
  def feed
    # preliminary implementation - full done in ch 12
    Micropost.where("user_id = ?", id)
  end
  
  # # CH 7 Exercises
  # ## Ex 1.1
  # def User.authenticate(email, submitted_password)
  #   user = find_by_email(email)
  #   return nil if user.nil?
  #   return user if user.has_password?(submitted_password)
  # end
  # 
  # ## Ex 1.2
  # def self.authenticate(email, submitted_password)
  #   user = user.find_by_email(email)
  #   return nil if user.nil?
  #   return user if user.has_password?(submitted_password)
  #   return nil
  # end
  # 
  # ## Ex 1.3
  # def self.authenticate(email, submitted_password)
  #   user = user.find_by_email(email)
  #   if user.nil?
  #     nil
  #   elsif user.has_password?(submitted_password)
  #     user
  #   else
  #     nil
  #   end
  # end
  # 
  # ## Ex 1.4
  # def self.authenticate(email, submitted_password)
  #   user = user.find_by_email(email)
  #   if user.nil?
  #     nil
  #   elsif user.haspassword?(submitted_password)
  #     user
  #   end
  # end
  # 
  # ## Ex 1.5
  # def self.authenticate(email, submitted_password)
  #   user = user.find_by_email(email)
  #   user && user.has_password?(submitted_password) ? user : nil
  # end
  

## PRIVATE METHODS ##
  private
  
    def encrypt_password
      self.salt = make_salt if new_record?
      self.encrypted_password = encrypt(self.password)
    end
    
    def encrypt(string)
      secure_hash("#{salt}--#{string}")
    end
    
    def make_salt
      secure_hash("#{Time.now.utc}--#{password}")
    end
    
    def secure_hash(string)
      Digest::SHA2.hexdigest(string)
    end
end
