extends Button

var label
var cost
var income

func init(lbl="Item", c=1, inc=1):
	label = lbl
	cost = c
	income = inc
	text = label + " { " + str(cost) + ", " + str(income) + " }"



func _on_ShopItem_pressed():
	WS.send_message(WS.TYPES.BUY_ITEM, {"cost": cost, "income": income})
