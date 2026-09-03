<?php

namespace App\Console\Commands;

use App\Services\ReservationService;
use Illuminate\Console\Command;

class ExpireExpiredReservationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:expire-reservations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire pending unpaid stock reservations that have exceeded their reservation duration';

    /**
     * Execute the console command.
     */
    public function handle(ReservationService $reservationService): int
    {
        $this->info('Checking for expired stock reservations...');

        $expiredCount = $reservationService->expireStaleReservations();

        $this->info("Expired {$expiredCount} stock reservation(s) and released reserved inventory.");

        return Command::SUCCESS;
    }
}
