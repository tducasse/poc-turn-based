extends Node2D


onready var shop := $Shop
onready var UI := $UIContainer
onready var clientConnect := get_node("/root/Main/HBoxContainer/Control")


# Called when the node enters the scene tree for the first time.
func _ready():
	var _shopConnection = shop.connect("on_unit_pressed", UI, "on_ressource_spent")
	var _startGameConnection = clientConnect.connect("on_start_game", UI, "start_prepTimer")

