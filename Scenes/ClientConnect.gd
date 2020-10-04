extends Control

# The URL we will connect to
var websocket_url = "ws://localhost:3000" if OS.is_debug_build() else "wss://projectv3.herokuapp.com"

# Our WebSocketClient instance
var _client = WebSocketClient.new()

onready var chat = $Chat
onready var chat_input = $Input


signal on_start_game()
signal connected()
signal back_to_lobby()
signal add_game_room(value)
signal remove_room(value)
signal restart_game()

var current_room = "lobby"

# disabled by default, because we need to wait for the server to be ready
# before we even attempt the connection
func _ready():
	# Connect base signals to get notified of connection open, close, and errors.
	_client.connect("connection_closed", self, "_closed")
	_client.connect("connection_error", self, "_closed")
	_client.connect("connection_established", self, "_connected")
	# This signal is emitted when not using the Multiplayer API every time
	# a full packet is received.
	# Alternatively, you could check get_peer(1).get_available_packets() in a loop.
	_client.connect("data_received", self, "_on_data")

	init()


func init():
	_client.connect_to_url(websocket_url)


func _closed(was_clean = false):
	# was_clean will tell you if the disconnection was correctly notified
	# by the remote peer before closing the socket.
	print("Closed, clean: ", was_clean)
	set_process(false)
	emit_signal("restart_game")


func _connected(_protocol):
	emit_signal("connected")
	print("Connected")


func _on_data():
	# Print the received packet, you MUST always use get_peer(1).get_packet
	# to receive data from server, and not get_packet directly when not
	# using the MultiplayerAPI.
	var data = _client.get_peer(1).get_packet().get_string_from_utf8()

	if not data:
		return
	
	data = parse_json(data)
	if not typeof(data) == TYPE_DICTIONARY:
		return

	var type = data.get("type")
	var payload = data.get("payload")
	
	match type:
		"list-rooms":
			add_old_rooms(payload)
		"create-room":
			add_game_room(payload)
		"remove-room":
			remove_room(payload)
		"new-chat-message":
			add_new_message(payload)
		"ready-game":
			ready_game()
		"begin":
			start_game()
		"back-to-lobby":
			move_back_to_lobby()
		_:
			print(type + ": not supported")


func _process(_delta):
	# Call this in _process or _physics_process. Data transfer, and signals
	# emission will only happen when calling this function.
	_client.poll()

func remove_room(room):
	emit_signal("remove_room", room)


func move_back_to_lobby():
	current_room = "lobby"
	emit_signal("back_to_lobby")


func add_new_message(message):
	chat.text +=message + '\n'


func leave_room(room := current_room):
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": "leave-room",
			"payload": room
		}
	).to_utf8())

	
func join_room(room):
	current_room = room
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": "join-room",
			"payload": room
		}
	).to_utf8())


func start_game():
	emit_signal("on_start_game")


func add_game_room(value):
	emit_signal("add_game_room", value)


func _on_Input_text_entered(new_text):
	chat_input.text = ""
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": "new-chat-message",
			"payload": new_text
		}
	).to_utf8())


func create_game(name):
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": "create-room",
			"payload": name
		}
	).to_utf8())


func add_old_rooms(rooms):
	for room in rooms:
		add_game_room(room)


func ready_game():
	_client.get_peer(1).put_packet(JSON.print(
		{
			"type": "ready-game"
		}
	).to_utf8())
