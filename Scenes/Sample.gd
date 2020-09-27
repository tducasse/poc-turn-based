extends Node2D


onready var shop := $Shop
onready var UI := $UIContainer
onready var serverControl := $Control


# Called when the node enters the scene tree for the first time.
func _ready():
	var _shopConnection = shop.connect("on_unit_pressed", UI, "on_ressource_spent")
	var _startGameConnection = serverControl.connect("on_start_game", UI, "start_prepTimer")


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass
