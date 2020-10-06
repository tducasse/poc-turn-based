extends Control

class_name NeedsServer

var _connection

func _ready():
	if not WS.is_connected_to_server():
		self.hide()
		set_process(false)
	_connection = WS.connect("connected", self, "_un_hide")
	_connection = WS.connect("disconnected", self, "_hide")

	
	
func _un_hide():
	set_process(true)
	self.show()


func _hide():
	set_process(false)
	self.hide()

