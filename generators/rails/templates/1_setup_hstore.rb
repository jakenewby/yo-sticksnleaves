class SetupHstore < ActiveRecord::Migration
  def change
    enable_extension('hstore')
  end
end
