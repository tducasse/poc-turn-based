extends Node2D


onready var shop := $Shop
onready var UI := $UIContainer
onready var client_connect = get_node("/root/Main/HSplitContainer/Control")


# Called when the node enters the scene tree for the first time.
func _ready():
	var _shop_connection = shop.connect("on_unit_pressed", UI, "on_ressource_spent")
	var _start_game_connection = client_connect.connect("on_start_game", UI, "start_prepTimer")


func _on_UIContainer_leave_room():
	client_connect.leave_room()
