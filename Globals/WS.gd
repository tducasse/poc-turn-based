extends Node

# The URL we will connect to
var websocket_url = "ws://localhost:3000" if OS.is_debug_build() else "wss://projectv3.herokuapp.com"

var _client = WebSocketClient.new()

var _timer
var keep_alive_timeout = 10.0

# all websocket message types
const TYPES = {
	"LIST_ROOMS": "list_rooms",
	"JOIN_ROOM": "join_room",
	"CREATE_ROOM": "create_room",
	"REMOVE_ROOM": "remove_room",
	"NEW_CHAT_MESSAGE": "new_chat_message",
	"READY_GAME": "ready_game",
	"BACK_TO_LOBBY": "back_to_lobby",
	"LEAVE_ROOM": "leave_room",
	"GAME__START_GAME": "game__start_game",
	"GAME__INIT_GAME": "game__init_game",
	"GAME__BUY_ITEM": "game__buy_item",
	"GAME__NEXT_ROUND": "game__next_round",
	"SET_NICKNAME": "set_nickname",
	"KEEP_ALIVE": "keep_alive",
}

# just because we call them dynamically and godot yells
# warning-ignore-all:unused_signal

# websocket message events
signal list_rooms(value)
signal create_room(value)
signal remove_room(value)
signal new_chat_message(value)
signal join_room(value)
signal back_to_lobby(value)
signal game__buy_item(value)
signal game__start_game(value)
signal game__init_game(value)
signal game__next_round(value)
signal set_nickname(value)

# websocket internal events
signal connected()
signal disconnected()

var nickname

var _connection

func _ready():
	set_process(false)
	_client.connect("connection_closed", self, "_closed")
	_client.connect("connection_error", self, "_closed")
	_client.connect("connection_established", self, "_connected")
	_client.connect("data_received", self, "_on_data")
	_connection = self.connect(TYPES.SET_NICKNAME, self, "_set_nickname")
	nickname = OS.get_unix_time()


func init():
	if is_connected_to_server():
		return
	set_process(true)
	_client.connect_to_url(websocket_url)


func _keep_alive():
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": TYPES.KEEP_ALIVE,
			"payload": true
		}
	).to_utf8())


func init_keep_alive():
	_timer = Timer.new()
	add_child(_timer)
	_timer.connect("timeout", self, "_keep_alive")
	_timer.set_wait_time(keep_alive_timeout)
	_timer.set_one_shot(false)
	_timer.start()


func _closed(_was_clean=false):
	emit_signal("disconnected")

func _connected(_protocol):
	set_nickname(nickname)
	emit_signal("connected")
	init_keep_alive()


func _on_data():
	var data = _client.get_peer(1).get_packet().get_string_from_utf8()
	if not data:
		return
	
	data = parse_json(data)
	if not typeof(data) == TYPE_DICTIONARY:
		return

	var type :String = data.get("type")
	var payload = data.get("payload")
	
	# no need to respond to this
	if type == TYPES.KEEP_ALIVE:
		return
	
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
	if not is_connected_to_server():
		return
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": type,
			"payload": payload
		}
	).to_utf8())
	
	
func set_nickname(nick):
	send_message(TYPES.SET_NICKNAME, nick)
	

func _set_nickname(nick):
	if not nick:
		return
	nickname = nick
