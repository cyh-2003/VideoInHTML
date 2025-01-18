using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    internal class Gaming : update
    {
        public void Update()
        {
            DrawWall();


            GameDate.food.Draw();
            
            SnakeMove();
            DrawSnake();
            

            GameDate.food.Crush();
            //
            score();
        }
        void DrawWall()
        {
            for (int i = 0; i < GameDate.walls.Length; i++)
            {
                GameDate.walls[i].Draw();
            }

        }
        void DrawSnake()
        {
            for (int i = 0; i < GameDate.counts; i++)
            {
                GameDate.snakes[i].Draw();
            }
        }
        void SnakeMove()
        {

            Console.SetCursorPosition(GameDate.snakes[GameDate.counts - 1].x, GameDate.snakes[GameDate.counts - 1].y);
            Console.WriteLine("  ");
            for (int i = GameDate.counts - 1; i > 0; i--)
            {
                GameDate.snakes[i].x = GameDate.snakes[i - 1].x;
                GameDate.snakes[i].y = GameDate.snakes[i - 1].y;

            }


            switch (GameDate.dir)
            {
                case Direction.up:
                    GameDate.snakes[0].y--;
                    break;
                case Direction.down:
                    GameDate.snakes[0].y++;
                    break;
                case Direction.left:
                    GameDate.snakes[0].x--;
                    break;
                case Direction.right:
                    GameDate.snakes[0].x++;
                    break;
            }
            BreakGame();
            GetInput(); 
        }
        void GetInput()
        {
            if (Console.KeyAvailable)
            {
                switch (Console.ReadKey(true).Key)
                {
                    case ConsoleKey.W:
                        if (GameDate.dir == Direction.down) break;
                        GameDate.dir = Direction.up;
                        break;
                    case ConsoleKey.A:
                        if (GameDate.dir == Direction.right) break;
                        GameDate.dir = Direction.left;
                        break;
                    case ConsoleKey.D:
                        if (GameDate.dir == Direction.left) break;
                        GameDate.dir = Direction.right;
                        break;
                    case ConsoleKey.S:
                        if (GameDate.dir == Direction.up) break;
                        GameDate.dir = Direction.down;
                        break;
                }
            }

        }
        void BreakGame()
        {
            if (GameDate.snakes[0].x >= 80 || GameDate.snakes[0].x <= 0)
            {
                Console.Clear();
                Game.nowScene = new End();
            }
            else if (GameDate.snakes[0].y >= 20 || GameDate.snakes[0].y <= 0)
            {
                Console.Clear();
                Game.nowScene = new End();
            }
            if (GameDate.counts > 1)
            {
                for (int i = 1; i < GameDate.counts; i++)
                {
                    if (GameDate.snakes[0] == GameDate.snakes[i])
                    {
                        Console.Clear();
                        Game.nowScene = new End();
                    }
                }
            }

        }
   
        void score()
        {
            Console.SetCursorPosition(30, 25);
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("分数:" + (GameDate.counts-1));
        }
    }
}
