extends MarginContainer

var _connection


func _ready():
	# start the websocket
	WS.init()
	_connection = WS.connect(WS.TYPES.JOIN_ROOM, self, "_join_room")


func _join_room(_value):
	if get_tree().change_scene("res://Scenes/Game/Game.tscn") != OK:
		print("Lobby.join_room(): An unexpected error occurred")

