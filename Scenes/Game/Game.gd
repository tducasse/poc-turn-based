extends MarginContainer

onready var resources_node = $VBoxContainer/TopLine/Resources
onready var income_node = $VBoxContainer/TopLine/Income
onready var health_node = $VBoxContainer/TopLine/Health
onready var timer_node = $VBoxContainer/TopLine/Timer
onready var prep_timer = $PrepTimer
onready var next_round_popup = $NextRoundPopup
onready var opponent_left_popup = $OpponentLeft
onready var game_over_popup = $GameOver
onready var ready_popup = $ReadyPopup
onready var shop_container = $VBoxContainer/HSplitContainer/Shop
onready var done = $VBoxContainer/Footer/Done
onready var waiting = $VBoxContainer/Footer/Waiting
onready var chat = $VBoxContainer/HSplitContainer/Chat

var resources = 0
var income = 0
var health = 0

var _connection

var waiting_text = "Waiting for your opponent..."

func _ready():
	_connection = WS.connect(WS.TYPES.GAME__BUY_ITEM, self, "_update_state")
	_connection = WS.connect(WS.TYPES.GAME__UPGRADE_ITEM, self, "_update_state")
	_connection = WS.connect(WS.TYPES.GAME__INIT_GAME, self, "_init_state")
	_connection = WS.connect(WS.TYPES.GAME__START_GAME, self, "_start_game")
	_connection = WS.connect(WS.TYPES.GAME__NEXT_ROUND, self, "_start_next_round")
	_connection = WS.connect(WS.TYPES.BACK_TO_LOBBY, self, "_back_to_lobby")
	_connection = WS.connect(WS.TYPES.OPPONENT_LEFT, self, "_opponent_left")
	_connection = WS.connect(WS.TYPES.GAME_OVER, self, "_game_over")
	_connection = game_over_popup.get_cancel().connect("pressed", self, "_on_Leave_pressed")
	done.hide()
	ready_popup.popup_centered()
	
	

func _back_to_lobby(_value):
	if get_tree().change_scene("res://Scenes/Lobby/Lobby.tscn") != OK:
		print("Lobby.join_room(): An unexpected error occurred")


func _on_Leave_pressed():
	WS.send_message(WS.TYPES.LEAVE_ROOM, true)

func update_player_stats(value):
	income = value.income
	resources = value.resources
	health = value.health
	update_node_text(resources_node, "Resources: " + str(resources))
	update_node_text(income_node, "Income: " + str(income))
	update_node_text(health_node, "HP: " + str(health))
	
	
func _update_state(value):
	shop_container.update_items(value.shopItems)
	update_player_stats(value)


func _init_state(value):
	shop_container.init(value.shopItems)
	update_player_stats(value)

func update_node_text(node, text):
	node.text = text


func start_prepTimer():
	prep_timer.start()
	

func _start_game(_value):
	unlock_shop()
	waiting.text = ""
	shop_container.show()
	done.show()
	prep_timer.start()


func _process(_delta):
	update_node_text(timer_node, str(round(prep_timer.time_left)))


func _on_PrepTimer_timeout():
	done.hide()
	next_round_popup.popup_centered()


func _start_next_round(_value):
	unlock_shop()
	waiting.text = ""
	done.show()
	prep_timer.start()
	
	
func lock_shop():
	shop_container.lock()
	

func unlock_shop():
	shop_container.unlock()


func _on_NextRoundPopup_confirmed():
	lock_shop()
	waiting.text = waiting_text
	WS.send_message(WS.TYPES.GAME__NEXT_ROUND, true)


func _on_ReadyPopup_confirmed():
	lock_shop()
	waiting.text = waiting_text
	WS.send_message(WS.TYPES.READY_GAME, true)


func _on_Done_pressed():
	prep_timer.stop()
	_on_PrepTimer_timeout()


func _opponent_left(_value):
	opponent_left_popup.popup_centered()


func _on_OpponentLeft_confirmed():
	_on_Leave_pressed()


func _game_over(_value):
	game_over_popup.popup_centered()


func _on_GameOver_confirmed():
	_on_ReadyPopup_confirmed()
	chat.reset_messages()
