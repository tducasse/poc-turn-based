extends Node

var queue = preload("res://Utils/ThreadLoader.gd").new()
var current_scene

# Called when the node enters the scene tree for the first time.
func _ready():
	queue.start()
	queue.queue_resource("res://Scenes/Sample.tscn", true)
	var root = get_tree().get_root()
	current_scene = root.get_child(root.get_child_count() -1)


func load_scene(path: String):
	if queue.is_ready(path):
		goto_scene(queue.get_resource(path))
	else:
		update_progress(queue.get_progress(path))


func goto_scene(scene):
	if (current_scene.name == "Main") :
		current_scene.hide()
	else:
		current_scene.queue_free()
	current_scene = scene.instance()
	current_scene.show()
	get_node("/root").add_child(current_scene)
	set_process(true)


func update_progress(progress):
	print(progress)
