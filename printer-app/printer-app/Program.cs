using System;
using System.Xml.Linq;
using System.Net.Http.Headers;
using bpac;
using System.Timers;

namespace MyProject;
class Program
{
    private static System.Timers.Timer aTimer;
    static void Main(string[] args)
    {
        if (args.Length != 1)
        {
            System.Console.WriteLine("Please enter a http endpoint to get the names from.");
            return;
        }
        SetTimer(args[0]);

        Console.WriteLine("\nPress the Enter key to exit the application...\n");
        Console.ReadLine();
        aTimer.Stop();
        aTimer.Dispose();

        Console.WriteLine("Terminating the application...");
    }

    // Set a timer to continuously get names every 5 seconds
    private static void SetTimer(string endpoint)
    {
        aTimer = new System.Timers.Timer(1000);
        aTimer.Elapsed += (sender, e) => GetNames(sender, e, endpoint);
        aTimer.AutoReset = true;
        aTimer.Enabled = true;
    }

    private static void GetNames(System.Object source, ElapsedEventArgs e, string endpoint)
    {
        try
        {
            using HttpClient client = new();
            string[] names = client.GetStringAsync(endpoint).Result.Split('\n', System.StringSplitOptions.RemoveEmptyEntries);
            foreach (string name in names)
            {
                Print(name);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }

    private static void Print(string text)
    {
        string[] name = text.Split(',');      
        string template = Directory.GetCurrentDirectory() + "\\template.LBX";
        bpac.DocumentClass doc = new DocumentClass();
        if (doc.Open(template) != false)
        {
            doc.GetObject("firstname").Text = name[0];
            doc.GetObject("lastname").Text = name[1];
            doc.StartPrint("", PrintOptionConstants.bpoDefault);
            doc.PrintOut(1, PrintOptionConstants.bpoDefault);
            doc.EndPrint();
            doc.Close();
        }
        else
        {
            Console.WriteLine("Cannot read template file.");
        }
    }
}
