extends Node2D


onready var rooms := $HSplitContainer/VSplitContainer/RoomList
onready var client_connect := $HSplitContainer/Control
onready var game_name := $HSplitContainer/VSplitContainer/VSplitContainer/RoomName
onready var wait_for_server := $WaitForServer 


# Called when the node enters the scene tree for the first time.
func _ready():
	var _shop_connection = client_connect.connect("add_game_room", self, "on_room_added")
	wait_for_server.visible = true
	
	
func on_room_added(value):
	rooms.add_item(value)


func _on_ItemList_item_activated(index):
	var room = rooms.get_item_text(index)
	client_connect.join_room(room)
	GameState.load_scene("res://Scenes/Sample.tscn")


func _on_CreateGame_pressed():
	var name = game_name.text
	if not name:
		return
	game_name.text = ""
	client_connect.create_game(name)


func _on_Control_connected():
	wait_for_server.visible = false


func _on_RoomName_text_entered(_new_text):
	_on_CreateGame_pressed()


func _on_Control_back_to_lobby():
	rooms.clear()
	GameState.restore_main_scene()


func _on_Control_remove_room(room):
	for i in range(rooms.get_item_count()):
		var current = rooms.get_item_text(i)
		if current == room:
			rooms.remove_item(i)
			break


func _on_Control_restart_game():
	if get_tree().current_scene.name != "Main":
		GameState.restore_main_scene()
	var _result = get_tree().reload_current_scene()
