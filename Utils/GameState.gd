extends Node

var current_scene
var old_main_scene

func _ready():
	var root = get_tree().get_root()
	current_scene = root.get_child(root.get_child_count() -1)

func restore_main_scene():
	current_scene.queue_free()
	current_scene = old_main_scene
	current_scene.show()

func load_scene(path):
	if (current_scene.name == "Main") :
		old_main_scene = current_scene
		current_scene.hide()
	else:
		current_scene.queue_free()
	var scene = load(path)
	current_scene = scene.instance()
	current_scene.show()
	get_node("/root").add_child(current_scene)
	set_process(true)
