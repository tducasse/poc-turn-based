extends Node2D


onready var rooms := $HSplitContainer/VSplitContainer/RoomList
onready var client_connect := $HSplitContainer/Control
onready var game_name := $HSplitContainer/VSplitContainer/VSplitContainer/RoomName
onready var wait_for_server := $WaitForServer 
onready var http := $HTTPRequest

var server_ready = false
var connected = false
var requesting = false

var server_address = "http://localhost:3000" if OS.is_debug_build() else "https://projectv3.herokuapp.com"


# Called when the node enters the scene tree for the first time.
func _ready():
	var _shop_connection = client_connect.connect("add_game_room", self, "on_room_added")
	wait_for_server.visible = true
	
	
func _process(_delta):
	if not server_ready and not requesting:
		requesting = true
		print('Trying to reach ' + server_address + "...")
		http.request(server_address)


func _on_HTTPRequest_request_completed(_result, response_code, _headers, _body):
	if response_code == 426:
		server_ready = true
		client_connect.init()
	requesting = false


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



func _on_Control_connected():
	wait_for_server.visible = false
