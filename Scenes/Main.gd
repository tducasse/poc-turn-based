extends Node2D


onready var rooms := $HBoxContainer/ItemList
onready var clientConnect := $HBoxContainer/Control


# Called when the node enters the scene tree for the first time.
func _ready():
		var _shopConnection = clientConnect.connect("add_game_room", self, "on_room_added")


func on_room_added(value):
	rooms.add_item(value)


func _on_ItemList_item_activated(index):
	print(index)
	GameState.load_scene("res://Scenes/Sample.tscn")
