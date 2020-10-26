extends TabContainer

var ShopItem = preload("res://Scenes/Game/Shop/ShopItem.tscn")
onready var attack_node =  $Attack/ItemContainer
onready var defense_node =  $Defense/ItemContainer
onready var income_node =  $Income/ItemContainer

var buttons = []


func init(items):
	for category_dict in items:
		var category = category_dict.category
		for item in category_dict.items:
			add_item_to_category(item, category)
			
			
# TODO: DO NOT REPLACE EVERYTHING
# TRY TO COMPUTE THE DIFFERENCES, EITHER SERVER SIDE OR HERE
func update_items(items):
	remove_all_buttons()
	var enable = true
	for category_dict in items:
		var category = category_dict.category
		for item in category_dict.items:
			add_item_to_category(item, category, enable)
			

func remove_all_buttons():
	buttons = []
	for node in [attack_node, defense_node, income_node]:
		for child in node.get_children():
			node.remove_child(child)
			child.queue_free()


func add_item_to_category(item, category, enable=false):
	var root_node : Control
	match category:
		"attack":
			root_node = attack_node
		"defense":
			root_node = defense_node
		"income":
			root_node = income_node
		_:
			print('category not supported ' + category)
	if not root_node:
		return
	var shop_item = ShopItem.instance()
	root_node.add_child(shop_item)
	shop_item.init(category, item, enable)
	buttons.append(shop_item)


func lock():
	for button in buttons:
		button.disable()


func unlock():
	for button in buttons:
		button.enable()
