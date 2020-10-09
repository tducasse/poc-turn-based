extends TabContainer

var ShopItem = preload("res://Scenes/Game/Shop/ShopItem.tscn")
onready var attack =  $Attack/ItemContainer
onready var defense =  $Defense/ItemContainer

var items = [
	{
		"category": "attack",
		"items": [
			{
				"label": "Unit 1",
				"cost": 1,
				"income": 1 
			},
			{
				"label": "Unit 2",
				"cost": 2,
				"income": 1 
			},
			{
				"label": "Unit 3",
				"cost": 3,
				"income": 2 
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
			root_node = attack
		"defense":
			root_node = defense
		_:
			print('category not supported ' + category)
	if not root_node:
		return
	var shop_item = ShopItem.instance()
	shop_item.init(item.label, item.cost, item.income)
	root_node.add_child(shop_item)
		
		
		
		
		
		
		
