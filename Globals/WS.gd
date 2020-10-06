extends Node

# The URL we will connect to
var websocket_url = "ws://localhost:3000" if OS.is_debug_build() else "wss://projectv3.herokuapp.com"

var _client = WebSocketClient.new()

# all websocket message types
const TYPES = {
	"LIST_ROOMS": "list_rooms",
	"CREATE_ROOM": "create_room",
	"REMOVE_ROOM": "remove_room",
	"NEW_CHAT_MESSAGE": "new_chat_message",
	"READY_GAME": "ready_game",
	"BEGIN": "begin",
	"BACK_TO_LOBBY": "back_to_lobby",
}

# just because we call them dynamically and godot yells
# warning-ignore-all:unused_signal

# websocket message events
signal list_rooms(value)
signal create_room(value)
signal remove_room(value)
signal new_chat_message(value)
signal ready_game(value)
signal begin(value)
signal back_to_lobby(value)

# websocket internal events
signal connected()
signal disconnected()

var ready = false

func _ready():
	set_process(false)
	_client.connect("connection_closed", self, "_closed")
	_client.connect("connection_error", self, "_closed")
	_client.connect("connection_established", self, "_connected")
	_client.connect("data_received", self, "_on_data")
	if ready:
		init()


func init():
	ready = true
	set_process(true)
	_client.connect_to_url(websocket_url)


func _closed(_was_clean=false):
	emit_signal("disconnected")

func _connected(_protocol):
	emit_signal("connected")


func _on_data():
	var data = _client.get_peer(1).get_packet().get_string_from_utf8()
	if not data:
		return
	
	data = parse_json(data)
	if not typeof(data) == TYPE_DICTIONARY:
		return

	var type :String = data.get("type")
	var payload = data.get("payload")
	
	# automatically call the right signal
	if TYPES.has(type.to_upper()):
		emit_signal(type, payload)
	else:
		print(type + ": not supported")


func is_connected_to_server():
	return _client.get_connection_status() == _client.CONNECTION_CONNECTED
	
	
func is_connecting_to_server():
	return _client.get_connection_status() == _client.CONNECTION_CONNECTING


func _process(_delta):
	_client.poll()
	if not is_connected_to_server() and not is_connecting_to_server():
		init()
	
	
func send_message(type, payload):
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": type,
			"payload": payload
		}
	).to_utf8())
	
	

