'use babel';

import { CompositeDisposable } from 'atom';

import packageConfig from './configSchema.json';

const child_process = require("child_process");
const exec = require('child_process').exec;

console.log('Python-Runner started');

// Function to reverse a string
function reverse(s)
{
	return s.split("").reverse().join("");
}

// Takes only the drive from the filepath
function getRoot(path)
{
	var os = require("os");
	return reverse(reverse(path).replace(/^.*[\\\/]/, ''));
}

// Gets the file path of the current file in Atom
function getFilePath()
{
	try
	{
		atom.workspace.getActiveTextEditor().buffer.save()
		var filePath = atom.
		workspace.
		getActiveTextEditor().
		buffer.
		file.
		path;
	}
	// If the file is not saved, it will throw a TypeError since there is
	//	neither a directory or filename
	catch(TypeError)
	{
		console.log('ERROR: Could not find the path to the current file, please make sure it is saved');
		return 0;
	}
	if (filePath == undefined)
	{
		console.log('ERROR: Cannot read filepath, is the file saved?');
		return 0;
	}
	else if (filePath.endsWith('.py') || filePath.endsWith('.pyw'))
	{
		console.log(filePath);
		return filePath;
	} else {
		console.log('ERROR: This is not a valid filetype');
		return 0;
	}
}

// Generates the command to use in the shell
function generateCommand()
{
	var filepath = getFilePath();
	if (filepath == 0)
	{
		return 0;
	}
	var root = getRoot(filepath);
	var dirname = filepath.substring(0,filepath.lastIndexOf("\\"));
	process.chdir(dirname);
	var cmd = 'start cmd.exe ';
	if(atom.config.get('python-runner.KeepConsole'))
	{
		cmd  += "/K ";
	} else {
		cmd += " & ";
	}
	if (atom.config.get('python-runner.Executable').indexOf(' ') != -1)
	{
		cmd += "\"" + atom.config.get('python-runner.Executable') + "\" ";
	}
	else
	{
		cmd += atom.config.get('python-runner.Executable') + " ";
	}
	if (filepath.indexOf(' ') != -1)
	{
		cmd += "\"" + filepath + "\"";
	}
	else
	{
		cmd += filepath;
	}
	console.log(cmd);
	return cmd
}

// Both functions are the wrappers for the package commands
function executePy()
{
	console.log('Executing Python File')
	// If the return is not a command, doesn't run
	command = generateCommand();
	if (command != 0)
	{
		shellExec(generateCommand());
	}
}

// Executes the command in the shell, msg is a boolean to display the stdout and
//	stderr from the executable if called from the 'Compile and Run'
function shellExec(cmd)
{
	exec(cmd, (error, stdout, stderr) =>
	{
		if (error)
		{
			console.log("Compilation Error");
			console.error(`exec error: ${error}`);
			return -1;
		}
		else
		{
			console.log("Successfully Compiled");
		}
	});
}

// Mainly from the how-to and default package examples, probably better to leave
export default
{
	subscriptions: null,
	config: packageConfig,
	activate(state)
	{
		this.subscriptions = new CompositeDisposable();

		this.subscriptions.add
		(
			atom.commands.add
			(
			'atom-text-editor',
			{
				'python-runner:executePy': () => executePy(),
			},
			'atom-workspace',
			{
				'myPackage:toggle': () => this.toggle()
			}
			)
		)
	},
	deactivate()
	{
		this.subscriptions.dispose();
	},
};
