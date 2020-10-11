extends Button

var label
var cost
var income
var defense
var attack
var type

var types = ['attack', 'income', 'defense']

func init(category, item):
	label = item.label
	cost = item.cost
	type = category
	match category:
		"attack":
			init_attack(item)
		"defense":
			init_defense(item)
		"income":
			init_income(item)
		_:
			print('Item category not supported')
	disabled = true
	
	
func init_attack(item):
	attack = item.attack
	text = label + " { " + str(cost) + ", " + str(attack) + " }"
	
	
func init_income(item):
	income = item.income
	text = label + " { " + str(cost) + ", " + str(income) + " }"
	
	
func init_defense(item):
	defense = item.defense
	text = label + " { " + str(cost) + ", " + str(defense) + " }"


func _on_ShopItem_pressed():
	match type:
		"attack":
			buy_attack()
		"defense":
			buy_defense()
		"income":
			buy_income()
		_:
			print('Item type not supported')
			
			
func buy_attack():
	WS.send_message(WS.TYPES.GAME__BUY_ITEM, {"cost": cost, "attack": attack, "type": type})
	

func buy_income():
	WS.send_message(WS.TYPES.GAME__BUY_ITEM, {"cost": cost, "income": income, "type": type})
	
	
func buy_defense():
	WS.send_message(WS.TYPES.GAME__BUY_ITEM, {"cost": cost, "defense": defense, "type": type})

