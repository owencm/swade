# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20141130101918) do

  create_table "categories", force: true do |t|
    t.string   "name",       null: false
    t.string   "shortname",  null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "product_displays", force: true do |t|
    t.string   "token",      null: false
    t.integer  "product_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "products", force: true do |t|
    t.string   "name",                                                  null: false
    t.string   "color",                                                 null: false
    t.string   "features",                                              null: false
    t.string   "designer",                                              null: false
    t.decimal  "price",          precision: 30, scale: 10,              null: false
    t.integer  "category_id",                                           null: false
    t.integer  "subcategory_id",                                        null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_uri",                                default: "", null: false
  end

  create_table "sessions", force: true do |t|
    t.string   "token",      null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "context"
  end

  create_table "subcategories", force: true do |t|
    t.string   "name",        null: false
    t.string   "shortname",   null: false
    t.integer  "category_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
