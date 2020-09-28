extends Node2D


onready var rooms := $HSplitContainer/VSplitContainer/RoomList
onready var client_connect := $HSplitContainer/Control
onready var game_name := $HSplitContainer/VSplitContainer/VSplitContainer/RoomName


# Called when the node enters the scene tree for the first time.
func _ready():
	var _shop_connection = client_connect.connect("add_game_room", self, "on_room_added")


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


func _on_JoinGame_pressed():
# TODO: check that the room exists before trying to connect
#	var name = game_name.text
#	if not name:
#		return
#	game_name.text = ""
#	client_connect.join_room(name)
#	GameState.load_scene("res://Scenes/Sample.tscn")
	pass
