extends Button

var label
var cost
var income

func init(lbl="Item", c=1, inc=1):
	label = lbl
	cost = c
	income = inc
	text = label + " { " + str(cost) + ", " + str(income) + " }"
	disabled = true



func _on_ShopItem_pressed():
	WS.send_message(WS.TYPES.GAME__BUY_ITEM, {"cost": cost, "income": income})
