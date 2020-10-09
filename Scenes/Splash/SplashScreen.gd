extends CenterContainer

func _ready():
	yield(get_tree().create_timer(1.0), "timeout")
	if get_tree().change_scene("res://Scenes/Lobby/Lobby.tscn") != OK:
		print("SplashScreen.ready(): An unexpected error occurred")
