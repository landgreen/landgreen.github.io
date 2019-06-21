**build a tic-tac-toe game with a computer player and a human player**
    team size: 3-4
    goals:
        computer player should be competitive
        graphics should clearly indicate game state
        user inputs should be intuitive and functional
        final project should be bug free
    variations:
        for a harder project
            try connect four, othello, 3-D tic-tac-toe, checkers
            outputting to three.js (very hard)
            save game state between sessions with cookies
            adjustable computer player difficulty
        for an easier project
            try rock paper scissors, guess a number between 1 and 10
            outputting to the console instead of graphics
            computer player just makes random moves


*team leader*
    document development process with detail and clarity (text)
        who is working on which tasks 
        list architecture choices for reference by team members
        weekly progress reports
    decide how to organize the game data (data)
        what data must be global and what can just be local to a function
        store game state 
           2-d array of strings?
        store player turn
        store winner
    communicate to team
        check in with team members one on one
            get to know what kinda of tasks each team member is good at
            help them get unstuck
        run team meetings
            discuss the options for organizing the game data
            discuss vision/theme/style of project
            listen to feedback from team members
                adjust project if needed
            assign tasks to team members
                tasks can change in the middle of a project
                give yourself tasks as well

*task: integration*
    put each function together into an active build
    player input (function) (event)  
        keyboard, pop ups, mouse, …
    check for win / tie game states (function)
        trigger win / tie graphics functions

*task: testing*
    test each individual function to see if they work
        consider writing functions that automate the testing
    test for bugs in the current build

*task: graphics*
    decide graphics platform with team leader
        Canvas, SVG, HTML, CSS, ...
    decide graphics style
    write a function that draw the game board
        indication game state to user
            board state
            indicate whose turn
            what symbol each player is using
    write a function that draws win animation (function)
    write a function that draws tie animation (function)

*task: computer opponent algorithm*
    choose the next move based on the current game state (function)
        write a function that returns the location for the computer's next move
        possible algorithm
            check game state for any 2 O’s in a row.
                check for a free space with the O's
                    move to win
            check game state for any 2 X’s in a row.
                check for a free space with the X's
                    move to block
            if no 2 in a rows are found make a random move