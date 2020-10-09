extends MarginContainer

onready var resources_node = $VBoxContainer/TopLine/Resources
onready var income_node = $VBoxContainer/TopLine/Income

var resources = 0
var income = 0

var _connection

func _ready():
	_connection = WS.connect(WS.TYPES.GAME__BUY_ITEM, self, "_update_resources_income")
	_connection = WS.connect(WS.TYPES.GAME__INIT_GAME, self, "_update_resources_income")
	_connection = WS.connect(WS.TYPES.GAME__START_GAME, self, "_start_game")
	_connection = WS.connect(WS.TYPES.BACK_TO_LOBBY, self, "_back_to_lobby")
	

func _back_to_lobby(_value):
	if get_tree().change_scene("res://Scenes/Lobby/Lobby.tscn") != OK:
		print("Lobby.join_room(): An unexpected error occurred")


func _on_Leave_pressed():
	WS.send_message(WS.TYPES.LEAVE_ROOM, true)


func _update_resources_income(value):
	income = value.income
	resources = value.resources
	update_node_text(resources_node, str(resources))
	update_node_text(income_node, str(income))
	
	
func update_node_text(node, text):
	node.text = text


func _send_ready(_value):
	WS.send_message(WS.TYPES.READY_GAME, true)
	

func _start_game(_value):
	print("game started")


func _on_Ready_pressed():
	WS.send_message(WS.TYPES.READY_GAME, true)
