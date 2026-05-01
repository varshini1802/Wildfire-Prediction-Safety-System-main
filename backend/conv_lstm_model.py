import torch
import torch.nn as nn

# ======================
# CONVLSTM CELL
# ======================

class ConvLSTMCell(nn.Module):
    def __init__(self, input_dim, hidden_dim, kernel_size, bias=True):
        super(ConvLSTMCell, self).__init__()

        padding = kernel_size // 2

        self.conv = nn.Conv2d(
            input_dim + hidden_dim,
            4 * hidden_dim,
            kernel_size,
            padding=padding,
            bias=bias
        )

        self.hidden_dim = hidden_dim

    def forward(self, x, h, c):
        combined = torch.cat([x, h], dim=1)
        conv_output = self.conv(combined)

        cc_i, cc_f, cc_o, cc_g = torch.split(conv_output, self.hidden_dim, dim=1)

        i = torch.sigmoid(cc_i)
        f = torch.sigmoid(cc_f)
        o = torch.sigmoid(cc_o)
        g = torch.tanh(cc_g)

        c_next = f * c + i * g
        h_next = o * torch.tanh(c_next)

        return h_next, c_next


# ======================
# CONVLSTM MODEL
# ======================

class ConvLSTM(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=16, kernel_size=3):
        super(ConvLSTM, self).__init__()

        self.cell = ConvLSTMCell(input_dim, hidden_dim, kernel_size)

        self.conv_out = nn.Conv2d(hidden_dim, 1, kernel_size=1)

    def forward(self, x):
        # x shape: (B, T, C, H, W)

        B, T, C, H, W = x.size()

        h = torch.zeros(B, self.cell.hidden_dim, H, W).to(x.device)
        c = torch.zeros(B, self.cell.hidden_dim, H, W).to(x.device)

        for t in range(T):
            h, c = self.cell(x[:, t], h, c)

        out = self.conv_out(h)

        return out