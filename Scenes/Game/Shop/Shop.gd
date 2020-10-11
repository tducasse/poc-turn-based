extends TabContainer

var ShopItem = preload("res://Scenes/Game/Shop/ShopItem.tscn")
onready var attack_node =  $Attack/ItemContainer
onready var defense_node =  $Defense/ItemContainer
onready var income_node =  $Income/ItemContainer

var buttons = []

var items = [
	{
		"category": "income",
		"items": [
			{
				"label": "1 point",
				"cost": 1,
				"income": 1
			},
			{
				"label": "2 points",
				"cost": 2,
				"income": 2
			}
		]
	},
	{
		"category": "attack",
		"items": [
			{
				"label": "1 point",
				"cost": 1,
				"attack": 1
			},
			{
				"label": "2 points",
				"cost": 2,
				"attack": 2
			}
		]
	},
	{
		"category": "defense",
		"items": [
			{
				"label": "1 point",
				"cost": 1,
				"defense": 1
			},
			{
				"label": "2 points",
				"cost": 2,
				"defense": 2
			}
		]
	}
]


func _ready():
	for category_dict in items:
		var category = category_dict.category
		for item in category_dict.items:
			add_item_to_category(item, category)


func add_item_to_category(item, category):
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
	shop_item.init(category, item)
	root_node.add_child(shop_item)
	buttons.append(shop_item)


func lock():
	for button in buttons:
		button.disabled = true


func unlock():
	for button in buttons:
		button.disabled = false
