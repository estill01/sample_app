class RenameEmailToEmailaddressInUsers < ActiveRecord::Migration
  def self.up
    rename_column :users, :email, :email_address
  end

  def self.down
    rename_column :users, :email_address, :email
  end
end
