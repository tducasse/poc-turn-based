extends NeedsServer


onready var messages := $Messages
onready var input := $Input

func _ready():
	_connection = WS.connect(WS.TYPES.NEW_CHAT_MESSAGE, self, "_add_message")


func _add_message(value):
	var message = value.message
	var nickname = value.nickname
	messages.text += str(nickname) + ": " + message + '\n'
	

func _on_Input_text_entered(new_text):
	WS.send_message(WS.TYPES.NEW_CHAT_MESSAGE, new_text)
	input.text = ''
