extends "res://Common/NeedsServer.gd"


onready var messages := $Messages
onready var input := $Input
onready var nickname_node = $VBoxContainer/Nickname

func _ready():
	_connection = WS.connect(WS.TYPES.NEW_CHAT_MESSAGE, self, "_add_message")
	_connection = WS.connect(WS.TYPES.SET_NICKNAME, self, "_update_nickname")
	_update_nickname(WS.nickname)


func _add_message(value):
	var message = value.message
	var nickname = value.get("nickname", "no name")
	messages.text += str(nickname) + ": " + message + '\n'
	messages.scroll_vertical = INF
	

func _on_Input_text_entered(new_text):
	WS.send_message(WS.TYPES.NEW_CHAT_MESSAGE, new_text)
	input.text = ''


func _update_nickname(value=""):
	nickname_node.text = str(value)


func _on_Nickname_focus_exited():
	WS.set_nickname(nickname_node.text)
	
func reset_messages():
	messages.text = ""
