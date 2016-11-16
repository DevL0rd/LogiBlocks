'LogiBlocks Server 0.0.1
'Author Alias: duharris
'Author Name: Dustin Harris
'Work Email:duharris@ebay.com
'Personal Email:dmhzmxn@gmail.com

Public Class Form1
    Public AppPath As String = Application.StartupPath & "\"
    'Handle the form load
    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        'Add version info to title
        Text = "LogiBlocks Server"
        'Show form
        Show()
        StartServer()
    End Sub

    Private WithEvents WebServerThread As Process
    Public WithEvents AvayaCodePukeThread As Process
    Private Delegate Sub AppendOutputTextDelegate(ByVal text As String)
    Private WithEvents sp_node_mysql As New Process
    Private Sub StartServer()
        WebServerThread = New Process
        AppendOutputText("Web Server Starting Up...")
        Try
            With WebServerThread.StartInfo
                .FileName = "node"
                .Arguments = "BIN\server.js"
                .UseShellExecute = False
                .CreateNoWindow = True
                .RedirectStandardInput = True
                .RedirectStandardOutput = True
                .RedirectStandardError = True
            End With
            WebServerThread.Start()
            WebServerThread.BeginErrorReadLine()
            WebServerThread.BeginOutputReadLine()
            AppendOutputText("Web server started successfully!")
            Button3.Text = "Stop Server"
        Catch ex As Exception
            AppendOutputText("Failed to start web server: " + ex.Message + vbNewLine + "Please verify that you have the latest Node.js installed from (https://nodejs.org/en/download/).")
        End Try
    End Sub
    Public Sub KillProcess(processName As String)
        Dim p As Process = New Process()
        With p.StartInfo
            .FileName = "taskkill"
            .Arguments = "/im " & processName & " /f"
            .UseShellExecute = False
            .CreateNoWindow = True
            .RedirectStandardInput = False
            .RedirectStandardOutput = False
            .RedirectStandardError = False
        End With
        p.Start()
    End Sub
    Private Sub AppendOutputText(ByVal text As String)
        Try
            If ConsoleOutput.InvokeRequired Then
                Dim myDelegate As New AppendOutputTextDelegate(AddressOf AppendOutputText)
                Me.Invoke(myDelegate, text)
            Else
                ConsoleOutput.Text = ConsoleOutput.Text & "[Server] [" & Date.Now.ToString("MM/dd/yy - hh:mm:ss") & "]: " & text & vbNewLine
            End If
        Catch ex As Exception

        End Try
    End Sub
    Private Sub WebServerThread_ErrorDataReceived(ByVal sender As Object, ByVal e As System.Diagnostics.DataReceivedEventArgs) Handles WebServerThread.ErrorDataReceived
        AppendOutputText(e.Data)
    End Sub

    Private Sub WebServerThread_OutputDataReceived(ByVal sender As Object, ByVal e As System.Diagnostics.DataReceivedEventArgs) Handles WebServerThread.OutputDataReceived
        AppendOutputText(e.Data)
    End Sub

    Private Sub KillServer()
        Try
            WebServerThread.Kill()
        Catch ex As Exception
        End Try
        AppendOutputText("Server stopped...")
        Button3.Text = "Start Server"
    End Sub
    Private Sub Form1_FormClosing(sender As Object, e As FormClosingEventArgs) Handles Me.FormClosing
        KillServer()
    End Sub

    Private Sub Button3_Click(sender As Object, e As EventArgs) Handles Button3.Click
        If Button3.Text = "Stop Server" Then
            KillServer()
        Else
            ConsoleOutput.Text = ""
            StartServer()
        End If
    End Sub

    Private Sub Button2_Click(sender As Object, e As EventArgs) Handles Button2.Click
        ConsoleOutput.Text = "Restarting..."
        KillServer()
        ConsoleOutput.Text = ""
        StartServer()
    End Sub

    Private Sub WebServerThread_Exited(sender As Object, e As EventArgs) Handles WebServerThread.Exited
        Button3.Text = "Start Server"
        AppendOutputText("Server stopped...")
    End Sub

    Private Sub ConsoleOutput_TextChanged(sender As Object, e As EventArgs) Handles ConsoleOutput.TextChanged
        If ConsoleOutput.Lines.Count() > 1000 Then
            Dim newList As List(Of String) = ConsoleOutput.Lines.ToList
            ' Remove the first line.  
            newList.RemoveAt(0)
            ConsoleOutput.Lines = newList.ToArray
        End If
        ConsoleOutput.SelectionStart = ConsoleOutput.TextLength
        ConsoleOutput.ScrollToCaret()
    End Sub
End Class
