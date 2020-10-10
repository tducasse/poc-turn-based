extends MarginContainer

onready var resources_node = $VBoxContainer/TopLine/Resources
onready var income_node = $VBoxContainer/TopLine/Income
onready var timer_node = $VBoxContainer/TopLine/Timer
onready var prep_timer = $PrepTimer
onready var next_round_popup = $NextRoundPopup
onready var ready_popup = $ReadyPopup
onready var shop_container = $VBoxContainer/Shop
onready var footer_container = $VBoxContainer/Footer
onready var waiting = $VBoxContainer/Waiting

var resources = 0
var income = 0

var _connection

func _ready():
	_connection = WS.connect(WS.TYPES.GAME__BUY_ITEM, self, "_update_resources_income")
	_connection = WS.connect(WS.TYPES.GAME__INIT_GAME, self, "_update_resources_income")
	_connection = WS.connect(WS.TYPES.GAME__START_GAME, self, "_start_game")
	_connection = WS.connect(WS.TYPES.GAME__NEXT_ROUND, self, "_start_next_round")
	_connection = WS.connect(WS.TYPES.BACK_TO_LOBBY, self, "_back_to_lobby")
	shop_container.hide()
	footer_container.hide()
	ready_popup.popup_centered()
	
	

func _back_to_lobby(_value):
	if get_tree().change_scene("res://Scenes/Lobby/Lobby.tscn") != OK:
		print("Lobby.join_room(): An unexpected error occurred")


func _on_Leave_pressed():
	WS.send_message(WS.TYPES.LEAVE_ROOM, true)


func _update_resources_income(value):
	income = value.income
	resources = value.resources
	update_node_text(resources_node, "Resources: " + str(resources))
	update_node_text(income_node, "Income: " + str(income))
	
	
func update_node_text(node, text):
	node.text = text


func start_prepTimer():
	prep_timer.start()
	

func _start_game(_value):
	waiting.hide()
	shop_container.show()
	footer_container.show()
	prep_timer.start()


func _process(_delta):
	update_node_text(timer_node, str(round(prep_timer.time_left)))


func _on_PrepTimer_timeout():
	shop_container.hide()
	footer_container.hide()
	next_round_popup.popup_centered()


func _start_next_round(_value):
	waiting.hide()
	shop_container.show()
	footer_container.show()
	prep_timer.start()


func _on_NextRoundPopup_confirmed():
	waiting.show()
	WS.send_message(WS.TYPES.GAME__NEXT_ROUND, true)


func _on_ReadyPopup_confirmed():
	waiting.show()
	WS.send_message(WS.TYPES.READY_GAME, true)


func _on_Done_pressed():
	prep_timer.stop()
	_on_PrepTimer_timeout()
