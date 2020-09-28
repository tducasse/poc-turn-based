extends Node

var queue = preload("res://Utils/ThreadLoader.gd").new()
var current_scene

func _ready():
	var root = get_tree().get_root()
	current_scene = root.get_child(root.get_child_count() -1)
	

func load_scene(path):
	if (current_scene.name == "Main") :
		current_scene.hide()
	else:
		current_scene.queue_free()
	var scene = load(path)
	current_scene = scene.instance()
	current_scene.show()
	get_node("/root").add_child(current_scene)
	set_process(true)
