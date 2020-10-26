extends PanelContainer

var object
var type

onready var buy_button = $VBoxContainer/Actions/Buy
onready var upgrade_button = $VBoxContainer/Actions/Upgrade
onready var name_label = $VBoxContainer/Title/Name
onready var stats_label = $VBoxContainer/Title/Stats
onready var upgrade_label = $VBoxContainer/Actions/Upgrade/LabelContainer/Price
onready var recruit_label = $VBoxContainer/Actions/Buy/LabelContainer/Price


func _ready():
	hide()


func init(category, item, enable=false):
	object = item.name
	type = category
	init_item(item)
	if not enable:
		disable()
	show()


func disable():
	buy_button.disabled = true
	upgrade_button.disabled = true


func enable():
	buy_button.disabled = false
	upgrade_button.disabled = false

	
func init_item(item):
	if type != 'income':
		recruit_label.text = str(item.price)
	else:
		buy_button.hide()
	name_label.text = str(item.name)
	stats_label.text = str(item.value)
	if not item.get('upgrade'):
		upgrade_button.hide()
	else:
		upgrade_label.text = str(item.upgrade)
	
	

func _on_Upgrade_pressed():
	WS.send_message(WS.TYPES.GAME__UPGRADE_ITEM, {"name": object})


func _on_Buy_pressed():
	WS.send_message(WS.TYPES.GAME__BUY_ITEM, {"name": object})
	
	
func update_item(item):
	 init_item(item)
