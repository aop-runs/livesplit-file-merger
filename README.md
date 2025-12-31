# LiveSplit File Merger

A simple React tool that allows you to combine multiple [LiveSplit](https://livesplit.org/) files from different speedruns into one big splits file that you can then download. You can use this tool for multi-game speedruns, main board/all category marathons, and even for longer categories that consist of multiple smaller ones. Everything is performed on the client-side within your web browser so nothing will ever be sent or stored onto a server.

Click [here](https://aop-runs.github.io/livesplit-file-merger/) to open the tool in your browser.

## Features

### Drag N' Drop Functionality:
* Upload .lss files by dragging them onto the upload container (or manually by clicking it).
* Reorder your split files by smoothly dragging each entry to its desired spot within your run using [@dnd-kit](https://docs.dndkit.com/) functionality.

### Split Entry Management:
* Aside from reordering your split files by dragging them, you can choose to reverse or sort them alphabetically by run name.
* Remove unwanted runs from your entries and duplicate runs as needed.
* View important properties about each entry in a seprate modal window.

### Split Template Creation:
* Create templates for your setup splits and subsplit cutoffs so you don't have to manually add them.
* Add optional parameters to each template to record current information about each setup split and subsplit cutoff.

### Speedrun.com Integration:
* Gather output game and category names utilizing the [Speedrun.com](https://www.speedrun.com/) API starting with a search of the requested game.
* Variables & other category metadata for your output splits can be configured here as well to support more use-cases from different leaderboards.

### Customization Options:
* Select whether to use full game splits or one split per game alongside whether to carry over your existing sum of best and/or PBs from each game as a separately named comparison.
* Modify the setup time or exclude setup splits all together for either all of your split entries or any individual ones.
* Decide if you like to use subsplits for each run (Note: This will remove existing subsplits from your entries).
* Determine your starting LiveSplit layout and offset for your output run or simply use both properties from the first run in your entries.
* Pick which additional comparisons present in each splits entry can be carried over.
* Choose whether to carry over real time and/or game time split times.

## Contributing

Want to help make this tool better? Feel free to work on an existing issue from [here](https://github.com/aop-runs/livesplit-file-merger/issues) or create a new issue relevant to the project.

1. Once [forking](https://github.com/aop-runs/livesplit-file-merger/fork) your own copy of the project, you may clone it in your desired worksapce by running<br>
`git clone https://github.com/YOUR-USERNAME/livesplit-file-merger.git`
2. Open the newly created project directory by running<br>
`cd livesplit-file-merger`
3. Ensure NodeJS is involved and then setup the Vite project and all of its dependencies by running<br>
`npm install`
4. Work off your local development server by running<br>
`npm run dev`
5. If everything is working correctly, you may open the localhost link returned from the last step in your desired browser and then start contributing.
